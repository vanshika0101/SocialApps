import { StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  // Add your styles here
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: 'black',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    fontSize: 16,
    marginVertical: 15,
    color: '#888',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#333',
  },
  signupLink: {
    color: '#4285F4', // Link style for Sign Up
    fontWeight: 'bold',
  },

});
export default styles;
