var chunk = function(arr, size) {
     let chunkedArray = []
     let index = 0
         while (index < arr.length) {
                 
             chunkedArray.push(arr.slice(index,index+size))
             index = index+size
         }
         console.log(chunkedArray)
};

const arr = [1,2,3,4,5,6]

chunk(arr,2)