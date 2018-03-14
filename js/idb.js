import idb from 'idb';

idb.open('tetsda' , 1 , function(upgradeDB) {
    var store = upgradeDB.createObjectStore('tas');
    store.put('world', 'hello');
});