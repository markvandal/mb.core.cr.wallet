import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'errors',

  initialState: {
    error: null,
  },

  reducers: {
    set: (state, { payload }) => ({
      ...state, error: payload
    }),
    reset: (state) => ({
      ...state, error: null
    })
  }
})


export const errorsActions = { ...slice.actions }

export const errors = slice.reducer