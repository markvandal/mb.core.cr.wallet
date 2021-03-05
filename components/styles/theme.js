
import { Dimensions, Platform } from 'react-native'
const window = Dimensions.get('window')

const width = Platform.OS === 'web' ? 350 : window.width

export const customTheme = {
  COLORS: {
    BLACK: '#030102',
    PRIMARY: '#063B8F',
    WHITE: '#FFFFFF',
    THEME: '#9EA8BD',
    GRAY: '#9EA8BD',
    TINTED: '#F7F7FA',
    ERROR: '#FE2472',
    LIGHT_DANGER: '#FDECEA',
  },
  SIZES: {
    BUTTON_WIDTH: width - 30,
    ERROR_WIDTH: width - 30,
    INPUT_WIDTH: width - 38,
    NAVBAR_WIDTH: width,
    BORDER_RADIUS: 3,
    BASE: 5,
    SIZE: 16,
    SMALL_ICON: 10,
    BACK_SIZE: 32,
  }
}