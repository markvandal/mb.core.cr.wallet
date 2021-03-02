
import { Dimensions } from 'react-native'

const window = Dimensions.get('window')

export const customTheme = {
  COLORS: {
    BLACK: '#030102',
    PRIMARY: '#063B8F',
    WHITE: '#FFFFFF',
    THEME: '#9EA8BD',
    GRAY: '#9EA8BD',
    TINTED: '#F7F7FA',
  },
  SIZES: {
    BUTTON_WIDTH: window.width - 30,
    INPUT_WIDTH: window.width - 38,
    BORDER_RADIUS: 3,
    BASE: 5,
    SIZE: 16,
    SMALL_ICON: 10,
    BACK_SIZE: 32,
  }
}