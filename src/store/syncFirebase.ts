import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
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
       syncCollection(state.academiesSettings, 'academiesSettings');

       const globalsRef = doc(db, 'globals', 'curriculumTexts');
       batch.set(globalsRef, { id: 'curriculumTexts', data: state.curriculumTexts }, { merge: true });

       await batch.commit();
       console.log("Data successfully synced to Firebase");
   } catch(e) {
       console.error("Error syncing to Firebase", e);
   }
};

export const startFirestoreSync = () => {
    const collections = [
        { name: 'users', key: 'students' },
        { name: 'classes', key: 'classes' },
        { name: 'checkins', key: 'checkins' },
        { name: 'products', key: 'products' },
        { name: 'orders', key: 'orders' },
        { name: 'financials', key: 'financials' },
        { name: 'events', key: 'events' },
        { name: 'announcements', key: 'announcements' },
        { name: 'appointments', key: 'appointments' },
        { name: 'classLogs', key: 'classLogs' },
        { name: 'visits', key: 'visits' },
        { name: 'academiesSettings', key: 'academiesSettings' },
    ];

    const unsubscribers: (() => void)[] = [];

    collections.forEach(({ name, key }) => {
        const unsub = onSnapshot(collection(db, name), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data());
            if (data.length > 0 || snapshot.metadata.fromCache === false) {
                const state = useDataStore.getState();
                const currentData = (state as any)[key] as any[];
                
                // Merge remote data into local state, keeping IDs unique
                const map = new Map();
                // We trust Firestore more as the source of truth
                data.forEach(item => map.set(item.id, item));
                
                useDataStore.setState({ [key]: Array.from(map.values()) });
            }
        }, (error) => {
            console.error(`Error in snapshot listener for ${name}:`, error);
        });
        unsubscribers.push(unsub);
    });

    // Special listener for globals
    const unsubGlobals = onSnapshot(collection(db, 'globals'), (snapshot) => {
        const curriculumDoc = snapshot.docs.find(d => d.id === 'curriculumTexts');
        if (curriculumDoc && curriculumDoc.data()?.data) {
            useDataStore.setState({ curriculumTexts: curriculumDoc.data()?.data });
        }
    });
    unsubscribers.push(unsubGlobals);

    return () => unsubscribers.forEach(unsub => unsub());
};

// Legacy support if needed elsewhere
export const loadFromFirebase = async () => {
    console.log("loadFromFirebase is now handled by startFirestoreSync listeners");
};
