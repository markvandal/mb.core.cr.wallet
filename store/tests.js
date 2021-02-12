import { createSlice } from '@reduxjs/toolkit'


const slice = createSlice({
  name: 'tests',

  initialState: {
    name: null,
    logs: [],
  },

  reducers: {
    setUp: (state, { payload }) => ({
      ...state, name: payload, logs: []
    }),

    log: (state, { payload }) => ({
      ...state, logs: [payload, ...state.logs]
    })
  },
})


export const testsActions = { ...slice.actions }

export const tests = slice.reducer