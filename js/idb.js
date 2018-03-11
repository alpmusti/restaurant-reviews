import idb from 'idb';

console.log("test 3");

var dbPromise = idb.open('test-db' , 1 , function(upgradeDb){
    var keyvalStore = upgradeDb.createObjectStore('keyval');
    keyvalStore.put('world' , 'hello');
});