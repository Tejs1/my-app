import React, { useState, useRef, useCallback } from "react"
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native"
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import * as FileSystem from "expo-file-system"
import * as Network from "expo-network"

export default function App() {
	const [facing, setFacing] = useState<CameraType>("back")
	const [isStreaming, setIsStreaming] = useState(false)
	const [permission, requestPermission] = useCameraPermissions()
	const cameraRef = useRef<CameraView>(null)

	const toggleCameraFacing = () => {
		setFacing(current => (current === "back" ? "front" : "back"))
	}

	const startStreaming = useCallback(async () => {
		if (cameraRef.current) {
			setIsStreaming(true)
			while (isStreaming) {
				const photo = await cameraRef.current.takePictureAsync({
					quality: 0.5,
					base64: true,
					exif: false,
				})

				if (photo && photo.base64) {
					await sendFrame(photo.base64)
				}

				// Add a small delay to control frame rate
				await new Promise(resolve => setTimeout(resolve, 100))
			}
		}
	}, [isStreaming])

	const stopStreaming = () => {
		setIsStreaming(false)
	}

	const sendFrame = async (base64Image: string) => {
		try {
			const ipAddress = await Network.getIpAddressAsync()
			console.log(ipAddress)
			const apiUrl = `http://${ipAddress}:3000/stream` // Assume your server is running on port 3000

			await FileSystem.uploadAsync(apiUrl, base64Image, {
				fieldName: "frame",
				httpMethod: "POST",
				uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
			})
		} catch (error) {
			console.error("Error sending frame:", error)
		}
	}

	if (!permission) {
		// Camera permissions are still loading
		return <View />
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet
		return (
			<View style={styles.container}>
				<Text style={styles.message}>
					We need your permission to show the camera
				</Text>
				<Button onPress={requestPermission} title="Grant permission" />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CameraView style={styles.camera} facing={facing} ref={cameraRef}>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
						<Text style={styles.text}>Flip Camera</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.button}
						onPress={isStreaming ? stopStreaming : startStreaming}
					>
						<Text style={styles.text}>
							{isStreaming ? "Stop Streaming" : "Start Streaming"}
						</Text>
					</TouchableOpacity>
				</View>
			</CameraView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: "transparent",
		margin: 64,
	},
	button: {
		flex: 1,
		alignSelf: "flex-end",
		alignItems: "center",
	},
	text: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
})
