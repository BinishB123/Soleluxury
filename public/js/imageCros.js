document.getElementById('imageField').addEventListener('change', handleFileSelect);
const hidden1 = document.getElementById('hiddenField1')
const hidden2 = document.getElementById('hiddenField2')
const hidden3 = document.getElementById('hiddenField3')
const hidden4 = document.getElementById('hiddenField4')
console.log("yeahh")
function handleFileSelect(event) {
    console.log("okkkk")
    var previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = ''; // Clear previous previews

    var files = event.target.files;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        let ind =i
        if (!file.type.startsWith('image/')) {
            continue; // Skip non-image files
        }

        var reader = new FileReader();

        reader.onload = (function (currentFile) {
            return function (e) {
                var previewImage = document.createElement('img');
                previewImage.className = 'preview-image';
                previewImage.src = e.target.result;
                previewImage.title = currentFile.name;
     
            
                var viewButton = document.createElement('button');
                viewButton.innerHTML = 'View';
                viewButton.id = `view${ind}`
                viewButton.type = 'button'
                viewButton.onclick = function() {
                    var modal = document.getElementById('myModal');
                    var modalImg = document.getElementById('img01');
                    modal.style.display = 'block';
                    // modalImg.src = e.target.result;


                    const image = document.getElementById('image');
                    image.src = e.target.result
                    const cropper = new Cropper(image, {
                        aspectRatio: 1/1,
                        viewMode:3
                    
                    });

                    document.querySelector('#btn-crop').addEventListener('click',async function(){
                        var croppedImage = await cropper.getCroppedCanvas().toDataURL("image/png");
                        let dimensions = cropper.getData()
                        // console.log(ind);
                        // console.log(dimensions);
                        previewImage.src= croppedImage
                        let x=dimensions.x
                        let y=dimensions.y

                        let height=dimensions.height

                        let width=dimensions.width

                        const imagedata="index= "+ind+" x= "+x+" y= "+y+" width= "+width+" height= "+height
                        console.log(imagedata);

                        if(ind == 0){
                            hidden1.value = imagedata
                        }
                        if(ind == 1){
                            hidden2.value = imagedata
                        }
                        if(ind == 2){
                            hidden3.value = imagedata
                        }
                        if(ind == 3){
                            hidden4.value = imagedata
                        }

                     
                        document.querySelector(".cropped-container").style.display = 'none';
                         modal.style.display = 'none';
                        cropper.destroy()
                    })
                };

           
             
            

                var container = document.createElement('div');
                container.appendChild(previewImage);
                container.appendChild(viewButton);
               
                previewContainer.appendChild(container);
            };
        })(file);

        reader.readAsDataURL(file);
    }
}

// Close modal when clicking on the close button
document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('myModal').style.display = 'none';

};

// Close modal when clicking anywhere outside the modal
window.onclick = function(event) {
    var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};