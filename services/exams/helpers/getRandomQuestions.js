let temp = []
let gen_nums = []

const generateArray = (length) => {
    for (let i = 1; i <= length; i++) {
        temp.push(i)
    }
}

const inArray = (array, el) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == el) return true;
    }
    return false;
}


const getRand = (array) => {
    var rand = array[Math.floor(Math.random() * array.length)];
    if (!in_array(gen_nums, rand)) {
        gen_nums.push(rand);
        return rand;
    }
    return get_rand(array);
}


