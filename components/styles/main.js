
import { StyleSheet } from 'react-native'

export const fragment_font_default = {
  fontFamily: 'regular'
}

export const styles = theme => StyleSheet.create({
  app_text: {
    ...fragment_font_default
  },
  header_block_title: {
    fontSize: 20,
    fontFamily: 'bold',
  },
  header_logo: {
    width: 48, 
    height: 48,
  },
  header: {
    height: 144,
  },
  header_block: {
    height: 96,
    alignSelf: 'flex-end',
  },
})