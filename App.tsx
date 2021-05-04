import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Button,
  Text,
  Alert,
  useColorScheme,
  NativeEventEmitter,
} from 'react-native';

import ZoomUs, {ZoomEmitter} from './zoom';
import {extractDataFromJoinLink} from './extractDataFromJoinLink';

import sdkJwtTokenJson from './api/sdk.jwt.json';

declare const global: {HermesInternal: null | {}};

// 1. `TODO`: Go to https://marketplace.zoom.us/develop/create and Create SDK App then fill `sdkKey` and `sdkSecret`
// There are TWO options to initialize zoom sdk: without jwt token OR with jwt token

// 1a. without jwt token (quick start while developing)
const skdKey = 'AXs14ee11FQ6sAWa1V7fQGtfR0kgq7meypVH';
const sdkSecret = '8QFGT3xwqy86FGwtWklTKbSCCDfTnU6S0CPP';

// 1b. with jwt token (should be used in production)
// - Replace you sdkKey and sdkSecret and run the following in the terminal:
// SDK_KEY=skdKey SDK_SECRET=sdkSecret yarn run sdk:get-jwt
// This will fill up ./api/sdk.jwt.json that will be used instead of sdkKey and sdkSecret
const sdkJwtToken = sdkJwtTokenJson.jwtToken;

// 2a. `TODO` Fill in start meeting data:
const exampleStartMeeting = {
  meetingNumber: '79930145265',
  // More info (https://devforum.zoom.us/t/non-login-user-host-meeting-userid-accesstoken-zoomaccesstoken-zak/18720/3)
  zoomAccessToken: 'cgqksgGqSItXGnJr4CVz5EppGlAehMe6Y1ve62aEPdc.BgYgSkNtclpjQ0UxVnZuZTh2UndJdFh5MDZ3bzNJTDMzb0ZANTg3MjFmZjA5NzM4MTI0YjIzNTBhZGI4ZDZjNDkxNmY4MTZmMmM2MmYwNDA3MTYxN2RmYmFkZjE4M2VkMmI3MgAMM0NCQXVvaVlTM3M9AAAAAAF5NqA6eAASdQAAAA', // `TODO`: Use API at https://marketplace.zoom.us/docs/api-reference/zoom-api/users/usertoken to get `zak` token
};

// 2b. `TODO` Fill in invite link:
const exampleJoinLink = 'https://us02web.zoom.us/j/76765125045?pwd=VUdRUlVaemtVL1lqWnVRMVFzUE1YZz09';

const exampleJoinMeeting = extractDataFromJoinLink(exampleJoinLink);

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isInitialized, setIsInitialized] = useState(false);

  console.log({isDarkMode});

  useEffect(() => {
    (async () => {
      try {
        const initializeResult = await ZoomUs.initialize(
          sdkJwtToken
            ? {jwtToken: sdkJwtToken}
            : {clientKey: skdKey, clientSecret: sdkSecret},
        );

        console.log({initializeResult});

        setIsInitialized(true);
      } catch (e) {
        Alert.alert('Error', 'Could not execute initialize');
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    // For more see https://github.com/mieszko4/react-native-zoom-us/blob/master/docs/EVENTS.md
    const zoomEmitter = new NativeEventEmitter(ZoomEmitter);
    const eventListener = zoomEmitter.addListener('MeetingEvent', ({event}) => {
      console.log({event}); //e.g.  "endedByHost" (see more: https://github.com/mieszko4/react-native-zoom-us/blob/ded76d63c3cd42fd75dc72d2f31b09bae953375d/android/src/main/java/ch/milosz/reactnative/RNZoomUsModule.java#L397-L450)
    });

    return () => eventListener.remove();
  }, [isInitialized]);

  const startMeeting = async () => {
    try {
      const startMeetingResult = await ZoomUs.startMeeting({
        userName: 'John',
        meetingNumber: exampleStartMeeting.meetingNumber,
        userId: exampleStartMeeting.zoomAccessToken,
        zoomAccessToken: exampleStartMeeting.zoomAccessToken,
      });

      console.log({startMeetingResult});
    } catch (e) {
      Alert.alert('Error', 'Could not execute startMeeting');
      console.error(e);
    }
  };

  const joinMeeting = async () => {
    try {
      const joinMeetingResult = await ZoomUs.joinMeeting({
        autoConnectAudio: true,
        userName: 'Wick',
        meetingNumber: exampleJoinMeeting.meetingNumber || '',
        password: exampleJoinMeeting.password || '',
      });

      console.log({joinMeetingResult});
    } catch (e) {
      Alert.alert('Error', 'Could not execute joinMeeting');
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={() => startMeeting()}
        title="Start example meeting"
        disabled={!isInitialized}
      />
      <Text>-------</Text>
      <Button
        onPress={() => joinMeeting()}
        title="Join example meeting"
        disabled={!isInitialized}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

export default App;
