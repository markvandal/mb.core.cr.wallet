import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


const produce = createAsyncThunk(
  'errors/produce',
  async (error) => {
    throw error
  }
)

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


export const errorsActions = { ...slice.actions, produce }

export const errors = slice.reducer