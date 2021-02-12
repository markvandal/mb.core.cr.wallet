import { recordActions } from '../../store'

export const list = dispatch => async () => {
  const res = await dispatch(recordActions.loadAll())
  res.payload?.records?.forEach(
    record => {
      if ('string' === typeof record) {
        dispatch(recordActions.load(record))
      }
    }
  )
}