import React, { Fragment } from 'react'
import { connect } from 'react-redux'

import { withGalio } from 'galio-framework'
import { styles } from './styles/main'
import { View, ActivityIndicator } from 'react-native'


export const Loading = connect(
  ({ spinner }, ownProps) => ({ spinner, ...ownProps })
)(withGalio(
  ({ spinner, styles}) => {
    return spinner.loading ? <View style={styles.spinner}>
      <View style={{opacity: '1 !important'}}>
      <ActivityIndicator size={'large'} color={'white'} /> 
      </View>
    </View> : null
  }, styles))