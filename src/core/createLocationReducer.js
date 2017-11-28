// @flow
import { ADD_ROUTES } from '../types'
import { isServer, urlToAction, typeToScene } from '../utils'

import type {
  LocationState,
  RoutesMap,
  Action,
  History
} from '../flow-types'

export default (routes: RoutesMap, history: History) => {
  const initialState = createInitialState(routes, history)

  return (
    st: LocationState = initialState,
    action: Action
  ): LocationState => {
    const r = routes[action.type]
    const l = action.location

    if (r && r.path && (l.url !== st.url || l.kind === 'load' || action.info === 'reset')) {
      const { type, payload, query, state, hash } = action
      return { type, payload, query, state, hash, hasSSR: st.hasSSR, ...l }
    }
    else if (action.type === ADD_ROUTES) {
      const count = Object.keys(action.payload.routes).length  // we need to be able to update Links when new routes are added
      const routesAdded = (st.routesAdded || 0) + count        // we could just increment a number, but why not at least off some info
      return { ...st, routesAdded }
    }
    else if (l && l.kind === 'setState') {
      const { state, location: { entries } } = action
      return { ...st, state, entries }
    }
    else if (action.type.indexOf('_ERROR') > -1) {
      const { error, type: errorType } = action
      return { ...st, error, errorType }
    }

    return st
  }
}

export const createInitialState = (
  routes: RoutesMap,
  history: History
): LocationState => {
  const { kind, entries, index, length, location, basename } = history
  const { url, pathname, search } = location
  const action = urlToAction(location, routes, basename)
  const { type, payload = {}, query = {}, state = {}, hash = '' } = action
  const scene = typeToScene(type)
  const hasSSR = isServer()

  return {
    type,
    payload,
    query,
    state,
    hash,

    url,
    pathname,
    search,
    basename,
    scene,

    kind: 'init',
    entries,
    index,
    length,

    hasSSR,

    prev: createPrev(hasSSR)
  }
}

export const createPrev = (hasSSR: boolean) => ({
  type: '',
  payload: {},
  query: {},
  state: {},
  hash: '',

  url: '',
  pathname: '',
  search: '',
  basename: '',
  scene: '',

  kind: '',
  entries: [],
  index: -1,
  length: 0,

  hasSSR
})