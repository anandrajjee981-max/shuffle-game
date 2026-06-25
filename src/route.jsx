import { createBrowserRouter } from "react-router-dom";
import Game from "./features/Game";
import History from "./features/History";


const router = createBrowserRouter([
{
    path : '/',
    element : <Game/>
},
{
    path : '/history',
    element : <History/>
}

])

export default router









