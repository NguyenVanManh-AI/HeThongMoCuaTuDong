import React, { createContext, useState, useEffect, useContext } from "react"
import { useNetInfo } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "./authContext";
import deepEqual from 'deep-equal';
import firestore from '@react-native-firebase/firestore';
import { FormatNotify } from '../utils/updateNotify';
import { FormatHistory } from '../utils/updateNotify';
export const DataContext = createContext()

export default function DataContextProvider({ children }) {
  const { user } = useContext(AuthContext);
  const netInfor = useNetInfo();
  const phone = user ? user.owner === true ? user.phone : user.owner : ""
  const [isHasNewHistory, setIsHasNewHistory] = useState(false)
  const [historys, setHistorys] = useState();
  const [numOfHistory, setNumOfHistory] = useState(10);
  const [isHistoryHas, setIsHistoryHas] = useState(false);
  const [loadMoreHistoryLoading, setLoadMoreHistoryLoading] = useState(false);

  const [isHasNewNotify, setIsHasNewNotify] = useState(false)
  const [notifys, setNotifys] = useState();
  const [numOfNotify, setNumOfNotify] = useState(10);
  const [isNotifyHas, setIsNotifyHas] = useState(false);
  const [loadMoreNotifyLoading, setLoadMoreNotifyLoading] = useState(false);


  useEffect(
    React.useCallback(() => {
      const getHistorysLocal = async () => {
        if (!historys) {
          setHistorys(JSON.parse(await AsyncStorage.getItem('historys')));
        }
      };
      getHistorysLocal();
      return () => {
        getHistorysLocal;
      };
    }, [historys]),
    [historys]
  );
  useEffect(
    React.useCallback(() => {
      const getNotifysLocal = async () => {
        const notifysLocal = JSON.parse(await AsyncStorage.getItem('notifys'));
        if (notifys && notifysLocal && notifys.length > 0 && notifysLocal.length > 0) {
          if (notifys[0].createAt < notifysLocal[0].createAt) {
            setNotifys(notifysLocal);
          }
        }
      };
      getNotifysLocal();
      return () => {
        getNotifysLocal;
      };
    }, [notifys]),
    [notifys]
  );

  useEffect(
    React.useCallback(() => {
      if (user && netInfor.isConnected) {
        const historysRef = firestore()
          .collection('historys')
          .where('phone', '==', phone)
          .orderBy('createAt', 'desc')
          .limit(numOfHistory);
        const unsubscribe = historysRef.onSnapshot(async snapshot => {
          if (snapshot) {
            const size = (await firestore()
              .collection('historys')
              .where('phone', '==', phone)
              .get()).size
            console.log(size)
            setIsHistoryHas(
              size > numOfHistory
            );

            const hists = [];
            await Promise.all(
              snapshot.docs.map(async doc => {
                if (doc.exists) {
                  hists.push(await FormatHistory(doc));
                }
              }),
            );

            if ((historys?.length != historys?.length || !deepEqual(historys, hists))) {
              setHistorys(hists);
              setIsHasNewHistory(true)
              setLoadMoreHistoryLoading(false);
              if (numOfHistory == 10) {
                await AsyncStorage.setItem('historys', JSON.stringify(hists));
              }
              console.log('reset historys');
            }
          }
        });
        return () => {
          unsubscribe();
        };
      }
    }, [netInfor, historys, numOfHistory, user]),
    [netInfor, historys, numOfHistory, user]
  );
  useEffect(
    React.useCallback(() => {
      if (user && netInfor.isConnected) {
        const notifysRef = firestore()
          .collection('notifys')
          .where('phone', '==', phone)
          .orderBy('createAt', 'desc')
          .limit(numOfNotify);

        const unsubscribe = notifysRef.onSnapshot(async snapshot => {
          if (snapshot) {
            setIsNotifyHas(
              (
                await firestore()
                  .collection('notifys')
                  .where('phone', '==', phone)
                  .get()
              ).size > numOfNotify,
            );
            const notis = [];
            await Promise.all(
              snapshot.docs.map(async doc => {
                if (doc.exists) {
                  notis.push(await FormatNotify(doc));
                }
              }),
            );
            if (!deepEqual(notifys, notis)) {
              setLoadMoreNotifyLoading(false);
              setNotifys(notis);
              if(notifys?.length>0)
              setIsHasNewNotify(true)
              if (numOfNotify == 10) {
                await AsyncStorage.setItem('notifys', JSON.stringify(notis));
              }
              console.log('reset notifys');
            }
          }
        });
        return () => {
          unsubscribe();
        };
      }
    }, [netInfor, notifys, numOfNotify, user]),
    [netInfor, notifys, numOfNotify, user]
  );
  const updateNumOfHistory = () => {
    setNumOfHistory(numOfHistory + 10)
  }
  const updateNumOfNotify = () => {
    setNumOfNotify(numOfNotify + 10)
  }
  const historysData = {
    historys,
    updateNumOfHistory,
    has: isHistoryHas,
    loadMoreLoading: loadMoreHistoryLoading,
    setLoadMoreLoading: setLoadMoreHistoryLoading,
    setIsHasNew: setIsHasNewHistory
  }
  const notifyData = {
    notifys,
    updateNumOfNotify,
    has: isNotifyHas,
    loadMoreLoading: loadMoreNotifyLoading,
    setLoadMoreLoading: setLoadMoreNotifyLoading,
    setIsHasNew: setIsHasNewNotify
  }
  const newData = {
    isHasNewHistory,
    isHasNewNotify
  }
  const dataContextData = { history: historysData, notify: notifyData, newData }
  return (<DataContext.Provider value={dataContextData}>
    {children}
  </DataContext.Provider>)
}