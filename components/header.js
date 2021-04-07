import React from 'react';
import {Image} from 'react-native';
import {withGalio, NavBar, Text, Block, Button} from 'galio-framework';
import logo from '../assets/design/meta/logo.png';
import {styles} from './styles/main';


export const Header = withGalio(({navigation, scene, theme, styles}) => {
    const {options} = scene.descriptor
    return <Block flex center>
            <Block bottom style={styles.header_settings}>
                <Button onlyIcon icon="gear" iconFamily="EvilIcons"
                        iconSize={25}
                        color="primary"
                        iconColor={theme.COLORS.WHITE}
                        style={{width: 33, height: 33}}
                        onPress={() => {alert("жмяк")}}/>
            </Block>

            <NavBar style={styles.header} leftIconSize={theme.SIZES.BACK_SIZE}
                    title={
                        <Block center space="evenly" style={styles.header_block}>
                            <Image style={styles.header_logo} source={logo}/>
                            <Text style={styles.header_block_title}>{options.title}</Text>
                        </Block>} back={scene.route.name !== "main"} onLeftPress={() => navigation.goBack()}/>
        </Block>
}, styles)

