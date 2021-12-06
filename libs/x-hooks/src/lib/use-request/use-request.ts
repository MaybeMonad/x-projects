/**
 * @name useRequest
 * @author @jinyang-io
 *
 * Based on XState, Inspired by ahooks/use-request
 *
 * context -> [defaultParams, results]
 * states -> [idle, loading, success, fail]
 * actions -> [FETCH, UPDATE, RETRY, FAIL, CACHE_PARAMS, UPDATE_DATA, UPDATE_ERROR_MSG]
 * guards -> requestValid -> code !== 1
 *
 * @TODO 支持队列请求
 * @TODO 取消动作
 * @TODO 并行/串行请求
 * @IMPROVE REFETCH 时 invoke 的 src 中无法直接更新 context 值，待优化
 */

import { RefObject, useEffect, useMemo, useRef } from 'react'
import { useMachine } from '@xstate/react'
import { createMachine, assign, DoneInvokeEvent } from 'xstate'
import { nanoid } from 'nanoid/non-secure'

export type RequestService<Params, Result> = (data: Params) => Promise<Result>
export type RequestServiceQueue<Params, Result> = {
  fetcher: (data: Params) => Promise<Result>
  key: string
}[]
export type RequestServices<P, R> =
  | RequestService<P, R>
  | RequestServiceQueue<P, R>

enum ACTIONS {
  FETCH = 'FETCH',
  REFETCH = 'REFETCH',
  RETRY = 'RETRY',
  UPDATE_DATA = 'UPDATE_DATA',
  CACHE_PARAMS = 'CACHE_PARAMS',
  UPDATE_ERROR_MSG = 'UPDATE_ERROR_MSG'
}

export interface RequestOptions<Params, Result, State> {
  /** Initial Data */
  initialData?: State

  /** Default Request Params */
  defaultParams?: Params

  /** Auto trigger */
  manual?: boolean

  /** Request Key */
  requestKey?: string

  /** Format Result */
  formatResult?(result: Result, params?: Params): State

  /** On Success Callback with Formatted Result and Request Params */
  onSuccess?(result: State, params?: Params): void

  /** On Fail */
  onFail?(msg: string): void

  /** On Refetch(with cached params) */
  onRefetch?(): void
}

export interface RequestMachineContext<Params, Result, State>
  extends RequestOptions<Params, Result, State> {
  params: Params
  data: State | undefined
  message: string
  cacheOptions: RefObject<RequestOptions<Params, Result, State>>
  lastRequestParams?: RequestOptions<Params, Result, State>['defaultParams'] &
    Params
}

export type RequestMachineEvent<Params, Result, State> =
  | {
      type: ACTIONS.FETCH
      data?: Params
      onRequestComplete?(result: State): void
    }
  | {
      type: ACTIONS.REFETCH
      data?: Params
      onRequestComplete?(result: State): void
    }
  | {
      type: ACTIONS.UPDATE_DATA
      data: State
    }
  | {
      type: ACTIONS.CACHE_PARAMS
      data: Params
    }
  | {
      type: ACTIONS.UPDATE_ERROR_MSG
      data: any
    }
  | {
      type: 'done.invoke.fetch'
      data: DoneInvokeEvent<Result & { msg?: string }>
    }

export function useRequest<P, R, S> (
  services: RequestServices<P, R>,
  options?: RequestOptions<P, R, S>
) {
  const id = useMemo(
    () =>
      options?.requestKey ??
      services.toString().match(/'(\S*)'/)?.[1] ??
      nanoid(),
    []
  )
  const cacheOptions = useRef<RequestOptions<P, R, S>>(
    {} as RequestOptions<P, R, S>
  )
  cacheOptions.current = options ?? {}

  const _services =
    services instanceof Array
      ? services.reduce((acc, cur) => {
          acc[cur.key] = cur.fetcher
          return acc
        }, {} as any)
      : { fetcher: services }

  const requestMachine = useMemo(
    () =>
      createMachine<
        RequestMachineContext<P, R, S>,
        RequestMachineEvent<P, R, S>
      >(
        {
          id,
          initial: 'idle',
          context: {
            manual: false,
            params: options?.defaultParams ?? ({} as P),
            data: options?.initialData ?? undefined,
            message: '',
            /** Internal States */
            cacheOptions,
            lastRequestParams: {} as P,
            ...options
          },
          states: {
            idle: {
              on: { FETCH: 'loading' }
            },
            loading: {
              on: {
                [ACTIONS.CACHE_PARAMS]: {
                  actions: assign({
                    lastRequestParams: (_, event) => {
                      return event.data
                    }
                  })
                }
              },
              invoke: {
                id: 'fetch',
                src: async (context, event: any) => {
                  const { onRequestComplete } = event
                  const _params =
                    event.type === ACTIONS.REFETCH
                      ? {
                          ...(context.lastRequestParams ?? {}),
                          ...(event.data ?? {})
                        }
                      : event.data ?? context.params

                  if (event.type === ACTIONS.REFETCH) {
                    context.onRefetch?.()
                  }

                  if (_params) {
                    send({
                      type: ACTIONS.CACHE_PARAMS,
                      data: _params
                    })

                    console.groupCollapsed(
                      `${id}: %c Request Params `,
                      `background: #368BFF; color: white; border-radius: 2px;`
                    )
                    console.table(_params)
                    console.groupEnd()
                  }

                  const result = await _services.fetcher(_params)

                  return { result, onRequestComplete }
                },
                onDone: [
                  {
                    target: 'success',
                    actions: (context, event) => {
                      const { result, onRequestComplete } = event?.data ?? {}
                      try {
                        const { onSuccess, formatResult, lastRequestParams } =
                          context ?? {}
                        const _result =
                          formatResult?.(result, lastRequestParams) ?? result

                        if (_result) {
                          send(ACTIONS.UPDATE_DATA, { data: _result })
                        }

                        onSuccess?.(_result, lastRequestParams)
                        onRequestComplete?.(_result)
                      } catch (e) {
                        send(ACTIONS.UPDATE_ERROR_MSG, { data: e })
                      }
                    },
                    cond: 'requestValid'
                  },
                  {
                    target: 'fail',
                    actions: (context, event) => {
                      const { result, onRequestComplete } = event?.data ?? {}
                      const { cacheOptions } = context
                      const { onFail } = cacheOptions.current ?? {}

                      send(ACTIONS.UPDATE_ERROR_MSG, { data: result?.msg })

                      onFail?.(result?.msg)
                      onRequestComplete?.(result)
                    }
                  }
                ],
                onError: {
                  target: 'fail',
                  actions: assign({
                    message: (_, event) => event.data
                  })
                }
              }
            },
            success: {
              on: {
                [ACTIONS.FETCH]: 'loading',
                [ACTIONS.UPDATE_DATA]: {
                  actions: ['updateData', 'updateMsg']
                },
                [ACTIONS.UPDATE_ERROR_MSG]: {
                  actions: 'updateMsg'
                },
                [ACTIONS.REFETCH]: 'loading'
              }
            },
            fail: {
              on: {
                [ACTIONS.REFETCH]: 'loading',
                [ACTIONS.FETCH]: 'loading',
                [ACTIONS.UPDATE_ERROR_MSG]: {
                  actions: 'updateMsg'
                }
              }
            }
          }
        },
        {
          services: _services,
          actions: {
            updateData: assign({
              data: (_, event) => event.data
            }),
            updateMsg: assign({
              message: (_, event) => event.data?.msg ?? event.data
            })
          },
          guards: {
            requestValid: (_, event) => {
              return event?.data?.result?.code !== -1
            }
          }
        }
      ),
    []
  )

  const [state, send] = useMachine(requestMachine)

  const loading = state.matches('loading')

  useEffect(() => {
    if (!options?.manual) {
      send({
        type: ACTIONS.FETCH,
        data: options?.defaultParams
      })
    }
  }, [])

  const data = useMemo(() => state.context.data, [state])

  useEffect(() => {
    switch (state.value) {
      case 'success':
        if (state.event.type === 'done.invoke.fetch') return
        console.groupCollapsed(
          `${id}: %c ${state.value} → ${state.event.type} `,
          `background: #1BA353; color: white; border-radius: 2px;`
        )
        console.table(state.context.data)
        console.groupEnd()
        break
      case 'fail':
        if (state.event.type === 'done.invoke.fetch') return
        console.log(
          `${id}: %c ${state.value} → ${state.event.type}${
            state.context.message ? '::' + state.context.message : ''
          }`,
          `background: #EB0013; color: white; border-radius: 2px;`
        )
        break
      case 'idle':
        console.log(
          `${id}: %c ${state.value} → ${state.event.type} `,
          `background: #7F8D9E; color: white; border-radius: 2px;`
        )
        break
      case 'loading':
        console.log(
          `${id}: %c ${state.value} → ${state.event.type} `,
          `background: #F2A10A; color: white; border-radius: 2px;`
        )
        break

      default:
        console.log(
          `${id}: %c ${state.value} → ${state.event.type} `,
          `background: #F2A10A; color: white; border-radius: 2px;`
        )
    }
  }, [state])

  return {
    data,
    run: (params?: P, onRequestComplete?: (result: S) => void) => {
      send({
        type: ACTIONS.FETCH,
        data: params,
        onRequestComplete
      })
    },
    mutate: (state: S) => send(ACTIONS.UPDATE_DATA, { data: state }),
    loading,
    refetch: (onRequestComplete?: (result: S) => void, params?: P) =>
      send({
        type: ACTIONS.REFETCH,
        data: params,
        onRequestComplete
      })
  }
}

export default useRequest
