var findDisappearedNumbers = function(nums) {

    let output =[]
    const newset = new Set(nums)
    console.log(newset)
   console.log(arr.length)
    for(let i=1;i<=nums.length;i++){
    if (!newset.has(i)) {
        output.push(i)
    }
    
}
console.log(output)
};
const  arr =[1,1]


findDisappearedNumbers(arr)