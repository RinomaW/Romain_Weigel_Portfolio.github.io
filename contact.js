const btncopy = document.querySelector('.copy-icon')
const txtCopy = document.querySelector('#email-address')

const email = "romwei0302@gmail.com"
console.log('cocusii');
btncopy.addEventListener('click', () =>{
    navigator.clipboard.writeText(email);
})