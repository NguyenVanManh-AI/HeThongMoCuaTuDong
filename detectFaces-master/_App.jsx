import { NavigationContainer } from "@react-navigation/native";
import App from "./App";
import AuthContextProvider from "./src/contexts/authContext";
import DataContextProvider from "./src/contexts/dataContext";
export default function _App() {
    return (
        <AuthContextProvider>
            <DataContextProvider>
                <NavigationContainer >
                    <App/>
                </NavigationContainer>
            </DataContextProvider>
        </AuthContextProvider>
    )
}