import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useDataStore } from './useDataStore';

export const syncToFirebase = async () => {
   const state = useDataStore.getState();
   
   try {
       const batch = writeBatch(db);

       const syncCollection = (items: any[], colName: string) => {
           items.forEach(item => {
               if(item.id) {
                   const ref = doc(db, colName, String(item.id));
                   batch.set(ref, item, { merge: true });
               }
           });
       };

       syncCollection(state.students, 'users');
       syncCollection(state.classes, 'classes');
       syncCollection(state.checkins, 'checkins');
       syncCollection(state.products, 'products');
       syncCollection(state.orders, 'orders');
       syncCollection(state.financials, 'financials');
       syncCollection(state.events, 'events');
       syncCollection(state.announcements, 'announcements');
       syncCollection(state.appointments, 'appointments');
       syncCollection(state.classLogs, 'classLogs');
       syncCollection(state.visits, 'visits');

       await batch.commit();
       console.log("Data successfully synced to Firebase");
   } catch(e) {
       console.error("Error syncing to Firebase", e);
   }
};

export const loadFromFirebase = async () => {
    try {
        const loadCol = async (colName: string) => {
            try {
                const snap = await getDocs(collection(db, colName));
                return snap.docs.map(d => d.data());
            } catch(e) {
                console.error(`Error loading collection ${colName} from Firebase`, e);
                return [];
            }
        };

        const students = await loadCol('users');
        const classes = await loadCol('classes');
        const checkins = await loadCol('checkins');
        const products = await loadCol('products');
        const orders = await loadCol('orders');
        const financials = await loadCol('financials');
        const events = await loadCol('events');
        const announcements = await loadCol('announcements');
        const appointments = await loadCol('appointments');
        const classLogs = await loadCol('classLogs');
        const visits = await loadCol('visits');

        const state = useDataStore.getState();
        
        // Merge Firebase data with current mock data, favoring Firebase
        const mergeArrays = (local: any[], remote: any[]) => {
            const map = new Map();
            local.forEach(i => map.set(i.id, i));
            remote.forEach(i => map.set(i.id, i));
            return Array.from(map.values());
        };

        useDataStore.setState({
            students: mergeArrays(state.students, students),
            classes: mergeArrays(state.classes, classes),
            checkins: mergeArrays(state.checkins, checkins),
            products: mergeArrays(state.products, products),
            orders: mergeArrays(state.orders, orders),
            financials: mergeArrays(state.financials, financials),
            events: mergeArrays(state.events, events),
            announcements: mergeArrays(state.announcements, announcements),
            appointments: mergeArrays(state.appointments, appointments),
            classLogs: mergeArrays(state.classLogs, classLogs),
            visits: mergeArrays(state.visits, visits)
        });

        console.log("Data successfully loaded from Firebase");
    } catch(e) {
        console.error("Critical error in loadFromFirebase", e);
    }
};
