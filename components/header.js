import React from 'react';

import { Image } from 'react-native'

import { withGalio, NavBar, Text, Block } from 'galio-framework'

import logo from '../assets/design/meta/logo.png'

import { styles } from './styles/main'


export const Header = withGalio(({ navigation, scene, theme, styles }) => {
  const { options } = scene.descriptor

  return <Block flex center><NavBar style={styles.header} leftIconSize={theme.SIZES.BACK_SIZE}
    title={<Block center space="evenly" style={styles.header_block}>
      <Image style={styles.header_logo} source={logo} />
      <Text style={styles.header_block_title}>{options.title}</Text>
    </Block>}
    back={scene.route.name !== "main"}
    onLeftPress={() => navigation.goBack()} />
  </Block>
}, styles)