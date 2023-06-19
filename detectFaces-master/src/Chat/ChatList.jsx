import { Container, Content } from "native-base"
import ChatListHeader from "./components/ChatListHeader"
import FriendSuggestion from "./components/FriendSuggestion"

import ConversationContent from "./components/ConversationContent"
export default () => {
    return (
        <Container>
            <ChatListHeader />
            <Content>
                <FriendSuggestion />
                <ConversationContent />
            </Content>
        </Container>

    )
}