   function duplicateElements(array){
        
        const newarray =[]

        for(i=0;i<array.length;i++){
            if (array[i]==array[i+1]&& !newarray.includes(array[i])) {
                 newarray.push(array[i])
            }
        }
        console.log(newarray)

   }











const  arr =[1,1,2,3,5,6,77,77,8]

duplicateElements(arr)