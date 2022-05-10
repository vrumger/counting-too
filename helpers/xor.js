const secret = process.env.SECRET_KEY;

const encrypt = number =>
    [...number.toString()].reduce(
        (result, char, index) =>
            result +
            (Number(char) ^ secret.charCodeAt(index % secret.length))
                .toString(16)
                .padStart(2, '0'),
        '',
    );

const decrypt = content => {
    let result = '';

    for (let i = 0; i < content.length; i += 2) {
        const hex = parseInt(content.slice(i, i + 2), 16);
        const key = secret.charCodeAt((i / 2) % secret.length);
        result += hex ^ key;
    }

    return Number(result);
};

module.exports = {
    encrypt,
    decrypt,
};
