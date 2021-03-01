
import { Dimensions } from 'react-native'

const window = Dimensions.get('window')

export const customTheme = {
  COLORS: {
    BLACK: '#030102',
    PRIMARY: '#063B8F',
    WHITE: '#ffffff',
  },
  SIZES: {
    BUTTON_WIDTH: window.width - 30,
    BORDER_RADIUS: 3,
    BASE: 5,
    SIZE: 14,
    SMALL_ICON: 10,
  }
}