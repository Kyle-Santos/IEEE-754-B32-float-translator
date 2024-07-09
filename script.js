$('#translateBtn').on('click', function() {
    const hexInput = $('#hexInput').val().trim();
    const binaryInput = $('#binaryInput').val().trim();
    const format = $('#format').val();
    let output = '';

    if (hexInput && isValidHex(hexInput)) {
        output = ieee754ToDecimal(hexInput.toUpperCase(), 'hex', format);
    } else if (binaryInput) {
        output = ieee754ToDecimal(binaryInput, 'binary', format);
    } else {
        output = 'Please enter a valid input.';
    }

    $('#output').val(output);
});

$('#copyBtn').on('click', function() {
    const output = $('#output').val();
    navigator.clipboard.writeText(output).then(() => {
        alert('Output copied to clipboard!');
    }, () => {
        alert('Failed to copy output.');
    });
});

function isValidHex(hex) {
    const hexRegex = /^[0-9A-Fa-f]{8}$/;
    return hexRegex.test(hex);
}

function ieee754ToDecimal(input, type, format) {
    let binary;
    if (type === 'hex') {
        if (input === 'FFFFFFFF') {
            return "NaN"
        }
        binary = parseInt(input, 16).toString(2).padStart(32, '0');
    } else if (type === 'binary') {
        binary = input.padStart(32, '0');
    } else {
        return 'Invalid input type.';
    }

    const sign = parseInt(binary.charAt(0), 2);
    let exponent = parseInt(binary.substr(1, 8), 2);
    const significand = binary.substr(9);

    // Special cases
    if (exponent === 0) {
        if (significand === '00000000000000000000000') {
            return sign === 0 ? '+0' : '-0';
        } 
        else {
            let denormalized = sign === 1 ? "-0." + significand : "+0." + significand;

            return trimTrailingZeros(denormalized) + "x2ˆ-126"; 
        } 
    }

    if (exponent === 255) {
        if (significand === '00000000000000000000000') {
            return sign === 0 ? '+Infinity' : '-Infinity';
        } else if (significand.startsWith('01')) {
            return 'sNaN';
        } else if (significand.startsWith('1')) {
            return 'qNaN';
        }
    }

    const unbiasedExponent = exponent - 127;
    const mantissa = '1' + significand;

    let decimal = 0;
    for (let i = 0; i < mantissa.length; i++) {
        decimal += parseInt(mantissa.charAt(i), 2) * Math.pow(2, unbiasedExponent - i);
    }

    decimal = sign === 1 ? -decimal : decimal;

    if (format === 'fixed') {
        return decimal.toFixed(100); // Adjust precision as needed
    } else {
        return decimal.toString();
    }
}

function trimTrailingZeros(decimalString) {
    return decimalString.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0*$/, '');
}
