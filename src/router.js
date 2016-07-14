/**
 * fork from: https://github.com/olav/dispatch.js
 */

 /*
  * Regex matchers.
  */
const escapeString = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g
const queryMatch = /\?([^#]*)?$/
const prefixMatch = /^[^#]*#/
const spaceMatch = /\s+/g
const fragMatch = /:([^\/]+)/g
const fragReplace = '([^\\/]+)'
const starMatch = /\\\*([^\/]+)/g
const starReplace = '?([^\\/]*)'
const endMatch = /\/$/

let id
let routes
let names
let paths
let handlers

const router = {
  /*
   * Reset all routes and callbacks.
   */
  reset () {
    // reset properties
    this.fallback = function () {}
    this.before = []
    this.after = []
    // reset local variables
    routes = {}
    handlers = {}
    names = {}
    paths = {}
    id = 0
  },

  /*
   * Add a new route.
   *
   * @name: An optional name for the route.
   * @path: The path the route should answer to, with parameters.
   * @handler: The handler function to call when this route is run.
   */
  on (name, path, handler) {
    if (arguments.length === 2) {
      handler = path
      path = name
    }

    if (names[name]) {
      return
    }

    // Create path matcher
    const str = '' + (path || '')
    const esc = str
        .replace(escapeString, '\\$&')
        .replace(fragMatch, fragReplace)
        .replace(starMatch, starReplace)
        .replace(endMatch, '')
    const matcher = new RegExp('^' + esc + '/?$')

    // Store route info
    names[name] = paths[path] = handlers[handler] = ++id
    routes[id] = {
      name,
      path: str,
      matcher,
      handler,
      id
    }
  },

  /*
   * Remove existing route(s).
   * Omit the argument to remove all routes.
   *
   * @x: The name, path or handler of the route to remove.
   */
  off (x) {
    if (typeof x === 'undefined') {
      return this.reset()
    }
    return !!(delete routes[names[x] || paths[x] || handlers[x] || x])
  },

  /*
   * Go to a route by changing the current hash,
   * ensuring that if that route is the current route,
   * the callback is still run.
   *
   * @path: The route to run.
   */
  go (path) {
    const curr = parsePath(window.location.hash)
    const next = parsePath(path)
    if (curr.path === next.path) {
      this.run(next)
    } else {
      window.location.hash = path
    }
  },

  /*
   * Get the current value of a named parameter.
   */
  get (param) {
    param = '' + param

    if (!param) {
      return
    }

    // Find matching route
    const hash = window.location.hash

    let next = this.route(hash)

    if (!next) {
      return
    }

    let prev = parsePath(hash)

    prev = prev.path.split('/')
    next = next.path.split('/')

    // Find value of named param
    for (let i = 0; i < next.length; i++) {
      if (next[i] === param) {
        return prev[i]
      }
    }
  },

  /*
   * Set (replace) a named parameter in the current path,
   * without running any of the matching handlers.
   *
   * @param: The parameter to replace (e.g. ":a").
   * @value: The new path value to insert.
   */
  set (param, value) {
    param = '' + param
    value = '' + value

    if (!param || !value) {
      return
    }

    // Find matching route
    const hash = window.location.hash

    let next = this.route(hash)

    if (!next) {
      return
    }

    let prev = parsePath(hash)

    prev = prev.path.split('/')
    next = next.path.split('/')

    // Replace first matching param
    for (let i = 0; i < next.length; i++) {
      skipNextChange = false

      if (next[i] !== param) {
        continue
      }

      if (prev[i] === value) {
        return
      }

      prev[i] = value
      skipNextChange = true
      window.location.replace('#' + prev.join('/'))
      return
    }
  },

  /*
   * Start at a route by changing the hash.
   *
   * @origin: Where to start, defaults to '/'.
   */
  start (origin) {
    origin = origin || '/'

    if (!window.location.hash) {
      window.location.hash = origin
    } else {
      this.run(parsePath(window.location.hash))
    }
  },

  /*
   * Run a route manually, without changing the location.
   * You should not have to use this method, try using
   * router.go or router.start instead.
   *
   * @path: The path which should trigger a route.
   * @params: Optional parameters to pass to the handler.
   */
  run (next = {}, prev = {}) {
    if (prev.path && next.path && prev.path === next.path) {
      return
    }

    // Find matching route
    const route = this.route(next.path)
    if (!route) {
      return this.fallback()
    }

    // Resolve parameters
    const vals = next.path.split('/')
    const keys = route.path.split('/')
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].charAt(0).match(/:|\*/)) {
        next[keys[i].substring(1)] = vals[i] || undefined
      }
    }

    // Run callbacks
    runCallback(this.before, () => {
      route.handler(next)
      runCallback(this.after)
    })
  },

  /*
   * Find a route by its name, path, handler or matcher.
   */
  route (x) {
    const route = routes[names[x] || paths[x] || handlers[x] || x]

    if (route) {
      return route
    }

    const parsed = parsePath(x).path

    for (const p in routes) {
      if (routes.hasOwnProperty(p) && routes[p] && routes[p].matcher.test(parsed)) {
        return routes[p]
      }
    }
  }
}

/*
 * Set to skip the next change event.
 */
let skipNextChange = false

/*
 * @internal Parse an input path.
 */
const parsePath = function (input) {
  const params = {
    path: '',
    query: ''
  }

  if (input) {
    input = decodeURIComponent(input)

    const query = input.match(queryMatch)
    params.query = query ? query[1] : ''

    params.path = input.replace(queryMatch, '')
      .replace(prefixMatch, '')
      .replace(endMatch, '')
      .replace(spaceMatch, '')
  }

  return params
}

/*
* @internal Run an array of methods with a final callback.
*/
const runCallback = function (callbacks, after) {
  after = after || function () {}
  if (callbacks.length === 0) {
    after(function () {})
  } else {
    callbacks[0](function () {
      runCallback(callbacks.slice(1), after)
    })
  }
}

/*
 * Listen on the hash change event to trigger routes,
 * with setInterval fallback for older browsers.
 */
const change = function ({ newURL, oldURL }) {
  if (skipNextChange) {
    skipNextChange = false
  } else {
    router.run(parsePath(newURL), parsePath(oldURL))
  }
}

if (!('onhashchange' in window)) {
  let prev = window.location.href
  setInterval(function () {
    const next = window.location.href
    if (prev === next) {
      return
    }
    change.call(window, {
      type: 'hashchange',
      newURL: next,
      oldURL: prev
    })
    prev = next
  }, 100)
} else if (window.addEventListener) {
  window.addEventListener('hashchange', change, false)
} else if (window.attachEvent) {
  window.attachEvent('onhashchange', change)
}

/*
 * Initialize internal state.
 */
router.reset()

export default router
