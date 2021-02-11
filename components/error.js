
import { Alert } from 'react-native'

export const alertError = (message) => {
  if (window?.alert) {
    alert(message)
  } else {
    Alert.alert(
      'Error occured',
      message,
      [
        { text: 'OK' }
      ]
    )
  }
}