const strings = ["apple", "banana", "orange", "strawberry", "kiwi"];

let new_string= strings.reduce((acum,strings)=>{
        if(!acum||strings.length>acum.length){
            return strings;
        }else{
            return acum;
        }
})

console.log(new_string)

 const filterd_string = strings.filter((strings)=>{return strings!==new_string})
console.log(filterd_string)