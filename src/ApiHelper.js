export let apiHelper = {
    url: 'https://script.google.com/macros/s/AKfycbxx7YX_Trnz6JbA1o0i4pxWM48bXyYR4cdZaxTeqsEA9uVZwtcbgyfeIGGJa5LlyyDI/exec',
    saveCharacter(user_id, data){
        return new Promise((resolve, reject) => {
            fetch(this.url + `?action=save_character&user_id=${user_id}&value=${data}`).then(response => response.json()).then(res => {
                resolve(res);
            }).catch(e => {
                reject(e);
            })
        })
    }
};