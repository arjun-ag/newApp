import {
    Text,
    SafeAreaView,
    View,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
    Pressable
} from "react-native";
import { Storage } from "aws-amplify";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { Video, ResizeMode, Audio } from "expo-av";
import CircularProgress from "react-native-circular-progress-indicator";
import { useState, useRef, useEffect } from "react";
import { TransitionPresets } from "@react-navigation/stack";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";

// Open Old Journal Entries on Calendar
// Handles all Media Types
const OldEntry = () => {
    const router = useRouter();
    const item = useLocalSearchParams();
    const video = useRef(null);
    const [status, setStatus] = useState({});
    const progressRef = useRef(null);
    const [pause, setPause] = useState(true);
    const [finish, setFinish] = useState(false);
    const [sound, setSound] = useState();
    const [soundTime, setSoundTime] = useState();
    const [media, setMedia] = useState();


    // Retrieve Token from Local Storage for Spotify API 
    // Identify Media Type and load States
    useEffect(() => {
        (async () => {
            try {
                if (item.contentType != 'song' && item.contentType != 'Text') {
                    const ressource = await Storage.get(item.key);
                    if (item.contentType == "audio") {
                        loadRecording(ressource);
                    } else {
                        setMedia(ressource);
                    }
                }
            } catch (e) {
                console.log('Error Retrieving Item:', e)
            }

        })()
    }, []);

    // Functions below are used for Audio/Video Playback and Interface 
    useEffect(() => {
        return sound
            ? () => {
                console.log("Unloading Sound");
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const playBack = async () => {
        if (!pause && !finish) {
            //pause sound currently playing
            await sound.pauseAsync();
            progressRef.current.pause();
            setPause(true);
        } else if (pause && !finish) {
            // track is paused and we want to continue
            await sound.playAsync();
            progressRef.current.play();
            setPause(false);
        } else if (pause && finish) {
            // restart sound when it ends
            await sound.replayAsync();
            setFinish(false);
            setPause(false);
            progressRef.current.reAnimate();
        }
    };

    // Load Recording 
    const loadRecording = async (audioLink) => {

        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: audioLink });
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setSound(sound);

        console.log("Loading Sound");
        const { durationMillis } = await sound.getStatusAsync();
        setPause(true);
        setSoundTime(durationMillis);
        progressRef.current.pause();
    };

    const onPlaybackStatusUpdate = async (playbackStatus) => {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
            console.log("Sound is done playing");
            setFinish(true);
            setPause(true);
        }
    };

    const updateStatus = async (status) => {
        setStatus(() => status);
        if (status.positionMillis === status.durationMillis && video.current) {
            video.current.pauseAsync();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    ...TransitionPresets.ModalSlideFromBottomIOS,
                }}
            />

            {/* DISPLAY NOTE ENTRY*/}
            <View style={{ alignSelf: "center" }}>
                <Pressable
                    onPress={() => {
                        router.back();
                    }}
                >
                    <MaterialIcons name="keyboard-arrow-down" size={40} color="white" />
                </Pressable>
            </View>
            {item?.contentType == "Text" && (
                <ScrollView style={styles.container}>
                    <Text style={styles.titleText}>{item.titleText}</Text>
                    <Text style={styles.contentText}>{item.text}</Text>
                </ScrollView>
            )}

            {/* DISPLAY SONG ENTRY*/}
            {item?.contentType == "song" && (
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 100,
                        rowGap: 15,
                    }}
                >
                    <Image
                        style={{ height: 300, width: 300, borderRadius: 20 }}
                        source={{ uri: "https://" + item.albumLink }}
                    />
                    <Text
                        style={{ color: "white", fontFamily: "InterMedium", fontSize: 19 }}
                    >
                        {item.songName}
                    </Text>

                    <Text
                        style={{
                            color: "#E6D9D9",
                            fontFamily: "InterMedium",
                            fontSize: 16,
                            marginBottom: 40,
                        }}
                    >
                        {item.artists}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            Linking.openURL("spotify:track:" + item.songID);
                        }}
                    >
                        <FontAwesome5 name="spotify" size={80} color="#F8F8F8" />
                    </TouchableOpacity>
                </View>
            )}

            {/* DISPLAY PICTURE ENTRY */}
            {item?.contentType == "picture" && media && (
                <View style={{ alignItems: "center", marginTop: 40 }}>
                    <Image
                        style={{ width: "90%", height: "90%", borderRadius: 50 }}
                        resizeMode="cover"
                        source={{ uri: media }}
                    />
                </View>
            )}

            {/* DISPLAY VIDEO ENTRY*/}
            {item?.contentType == "video" && (
                <View
                    style={{
                        width: 390,
                        height: 700,
                        overflow: "hidden",
                        borderRadius: 50,
                        alignSelf: "center",
                        alignItems: "center",
                        marginTop: 20,
                        justifyContent: "center",
                    }}
                >
                    <Video
                        ref={video}
                        style={styles.video}
                        source={{
                            uri: media,
                        }}
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        onPlaybackStatusUpdate={updateStatus}
                    />

                    <Pressable
                        onPress={() =>
                            status.isPlaying
                                ? video.current.pauseAsync()
                                : video.current.playAsync()
                        }
                        style={{ position: "absolute" }}
                    >
                        <Ionicons
                            name={status.isPlaying ? "pause" : "play"}
                            size={50}
                            color="white"
                        />
                    </Pressable>
                </View>
            )}

            {/* AUDIO ENTRY */}
            {item?.contentType == "audio" && sound && (
                <View style={styles.open}>
                    <CircularProgress
                        ref={progressRef}
                        value={100}
                        radius={150}
                        duration={soundTime}
                        activeStrokeColor="white"
                        showProgressValue={false}
                        inActiveStrokeWidth={15}
                        activeStrokeWidth={15}
                        inActiveStrokeColor="grey"
                        inActiveStrokeOpacity={0.3}
                    />
                    <TouchableOpacity onPress={playBack} style={styles.test}>
                        <Ionicons name={pause ? "play" : "pause"} size={50} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default OldEntry;

const styles = StyleSheet.create({
    video: {
        width: 400,
        height: 700,
    },
    container: {
        flexDirection: "column",
        rowGap: 5,
        paddingLeft: 5,
        paddingRight: 5,
        marginTop: 60,
    },
    titleText: {
        color: "white",
        width: "100%",
        paddingLeft: 10,
        fontSize: 30,
        fontFamily: "InterMedium",
        marginBottom: 10,
    },

    contentText: {
        color: "white",
        height: 20,
        width: "100%",
        fontSize: 17,
        fontFamily: "InterRegular",
        minHeight: 500,
        paddingLeft: 10,
    },

    text: {
        color: "white",
        fontSize: 15,
        fontFamily: "InterMedium",
        marginTop: 60,
        textAlign: "center",
    },
    test: {
        width: 50,
        height: 50,
        position: "absolute",
    },
    open: {
        height: "90%",
        justifyContent: "center",
        alignItems: "center",
    },
});
