import React, { useContext, useCallback, useEffect } from 'react'
import { connect } from 'react-redux'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { styles } from '../styles/main';


export const Client = connect(
  () => ({}),
  () => ({}),
)(withGalio(() => {
  return <Block><Text>Hello world</Text></Block>
}, styles))