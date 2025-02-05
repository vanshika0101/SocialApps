import { StyleSheet } from "react-native";
const  styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  imageContainer: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' },
  image: { width: 100, height: 100, margin: 5, borderRadius: 10 },
  textInputContainer: { padding: 20, backgroundColor: '#fff', flex: 1 },
  textInput: { height: 150, fontSize: 18, textAlignVertical: 'top' },
  card: { width: '100%', padding: 20, backgroundColor: '#fff', position: 'absolute', bottom: 0 },
  option: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  optionText: { marginLeft: 10, fontSize: 18 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3232a8', padding: 15, borderRadius: 50 },
  saveButton: { position: 'absolute', bottom: 30, right: 100, backgroundColor: '#4CAF50', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }
,profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
},
userName: {
    fontSize: 16,
    fontWeight: 'bold',
},

});
export default styles;
