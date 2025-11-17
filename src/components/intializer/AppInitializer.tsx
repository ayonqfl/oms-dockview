import React , {useEffect} from "react";
import { useDispatch , useSelector } from "react-redux";
import { loadDseSymbols } from "../../utilities/helpers/marketHelper";


const AppInitilizer = (): any => {
 
  const dispatch = useDispatch();
  useEffect(() => {
    loadDseSymbols(dispatch);
  }, []);

  // 🔹 Get All Symbols

}

export default AppInitilizer;