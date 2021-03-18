import React, { Fragment } from 'react'
import { connect } from 'react-redux'

import { withGalio } from 'galio-framework'
import { styles } from './styles/main'
import { View } from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay';


export const Loading = connect(
  ({ spinner }, ownProps) => ({ spinner, ...ownProps })
)(withGalio(
  ({ spinner, styles }) => {
    return <View style={styles.spinner}>
      {
        spinner.loading ? <Spinner visible={true} color={'gray'} animation={"fade"} /> : null
      }
    </View>
  }, styles))