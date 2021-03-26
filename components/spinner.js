import React from 'react'
import { connect } from 'react-redux'

import { withGalio } from 'galio-framework'
import { styles } from './styles/main'
import { View, ActivityIndicator, Text } from 'react-native'


export const Loading = connect(
  ({ spinner }, ownProps) => ({ spinner, ...ownProps })
)(withGalio(({ spinner, styles}) => {
  return spinner.loading ? <View style={styles.spinner}>
    <ActivityIndicator style={{marginTop: -30}} size={'large'} color={'white'} /> 
    <Text style={{opacity: '1 !important', marginTop: 20, color: 'white'}}>Транзакция может занять время. Пожалуйста, подождите...</Text>
  </View> : null
}, styles))
