import { createServer } from 'node:http'
import {
  createReadStream,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
} from 'node:fs'
import { readFile, realpath, stat } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const script = fileURLToPath(import.meta.url)
const project = resolve(dirname(script), '..')
const site = resolve(project, 'dist')
const index = resolve(site, 'index.html')
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function inspect(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(1000),
    })
    const html = await response.text()
    return response.ok && /<title>GeckoGenetics\b/.test(html)
      ? 'ready'
      : 'occupied'
  } catch (error) {
    return error.cause?.code === 'ECONNREFUSED' ? 'free' : 'occupied'
  }
}

async function serve(port) {
  const root = await realpath(site)
  const server = createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      )
      const file = resolve(
        root,
        `.${pathname === '/' ? '/index.html' : pathname}`,
      )
      if (!file.startsWith(root + sep)) throw new Error('Outside site')
      const resolved = await realpath(file)
      if (!resolved.startsWith(root + sep)) throw new Error('Outside site')
      const info = await stat(resolved)
      if (!info.isFile()) throw new Error('Not a file')
      response.writeHead(200, {
        'Content-Type': types[extname(resolved)] ?? 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      })
      if (request.method === 'HEAD') response.end()
      else
        createReadStream(resolved)
          .on('error', () => response.destroy())
          .pipe(response)
    } catch {
      response
        .writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        .end('Not found')
    }
  })
  server.on('error', (error) => {
    console.error(error.message)
    process.exit(1)
  })
  server.listen(port, '127.0.0.1', () =>
    console.log(`GeckoGenetics: http://127.0.0.1:${port}/`),
  )
}

async function launch() {
  let port
  for (let candidate = 5188; candidate <= 5198; candidate++) {
    const status = await inspect(candidate)
    if (status === 'occupied') continue
    port = candidate
    if (status === 'ready') break
    const logs = resolve(project, '.preview')
    mkdirSync(logs, { recursive: true })
    const log = openSync(resolve(logs, 'server.log'), 'a')
    const child = spawn(process.execPath, [script, '--serve', String(port)], {
      cwd: project,
      detached: true,
      windowsHide: true,
      stdio: ['ignore', log, log],
    })
    closeSync(log)
    let spawnError
    child.on('error', (error) => {
      spawnError = error
    })
    child.unref()
    let ready = false
    for (let attempt = 0; attempt < 40; attempt++) {
      if (spawnError) throw spawnError
      await delay(150)
      if ((await inspect(port)) === 'ready') {
        ready = true
        break
      }
    }
    if (!ready)
      throw new Error(
        `Server could not start. Details: ${resolve(logs, 'server.log')}`,
      )
    break
  }
  if (!port) throw new Error('No available preview port between 5188 and 5198.')
  const url = `http://127.0.0.1:${port}/`
  console.log(`Ready: ${url}`)
  console.log(
    'After a computer restart, double-click Start-GeckoGenetics.cmd again.',
  )
  if (process.argv.includes('--open')) {
    const command =
      process.platform === 'win32'
        ? 'rundll32.exe'
        : process.platform === 'darwin'
          ? 'open'
          : 'xdg-open'
    const args =
      process.platform === 'win32'
        ? ['url.dll,FileProtocolHandler', url]
        : [url]
    const browser = spawn(command, args, {
      detached: true,
      windowsHide: true,
      stdio: 'ignore',
    })
    browser.on('error', () => console.log(`Open ${url} in your browser.`))
    browser.unref()
  }
}

try {
  if (!existsSync(index))
    throw new Error(
      'Production files are missing. Run pnpm install and pnpm build first, or use the ready-to-run local ZIP.',
    )
  if (!(await readFile(index, 'utf8')).includes('GeckoGenetics'))
    throw new Error('This folder does not contain a GeckoGenetics build.')
  if (process.argv.includes('--serve')) {
    const port = Number(process.argv[process.argv.indexOf('--serve') + 1])
    if (!Number.isInteger(port) || port < 1024 || port > 65535)
      throw new Error('Invalid preview port')
    await serve(port)
  } else await launch()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
