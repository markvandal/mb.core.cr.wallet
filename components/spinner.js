import React, { Fragment } from 'react'
import { connect } from 'react-redux'

import { withGalio } from 'galio-framework'
// import { spinnerActions } from '../store'
import { styles } from './styles/main'
import { spinnerActions } from '../store'
import { View } from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay';


export const Loading = connect(
  ({ spinner }, ownProps) => ({ spinner, ...ownProps }),
  (dispatch) => ({
    loading: () => dispatch(spinnerActions.startLoading()),
    loaded: () => dispatch(spinnerActions.endLoaded()),
  })
)(withGalio(
  ({ spinner, styles }) => {
    return <View style={styles.spinner}>
      {
        spinner.loaded ? <Spinner color={'gray'} overlayColor={'rgba(0, 0, 0, 0.25)'} animation={"fade"} size={"large"}/> : null
      }
    </View>
  }, styles))