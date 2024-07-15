/** Event Listener for the Translate Button */

$('#translateBtn').on('click', function() {
    const hexInput = $('#hexInput').val().trim();
    const binaryInput = $('#binaryInput').val().trim();
    const format = $('#format').val();
    let output = '';


    // Checks if hex input is valid then convert if true
    if (hexInput && isValidHex(hexInput)) {
        output = ieee754ToDecimal(hexInput.toUpperCase(), 'hex', format);

    // Checks if binary input is valid then convert if true
    } else if (binaryInput && isValidBinary(binaryInput)) {
        output = ieee754ToDecimal(binaryInput, 'binary', format);
    } else {
        output = 'Please enter a valid input.';
    }

    $('#output').val(output);
});

/** Event Listener for the Copy Button */

$('#copyBtn').on('click', function() {
    const output = $('#output').val();
    navigator.clipboard.writeText(output).then(() => {
        alert('Output copied to clipboard!');
    }, () => {
        alert('Failed to copy output.');
    });
});

/** Function to be called for checking the validity of HEX Input */

function isValidHex(hex) { 
    const hexRegex = /^[0-9A-Fa-f]{8}$/;
    return hexRegex.test(hex);
}

/** Function to be called for checking the validity of BINARY Input */

function isValidBinary(binary) {
    const binaryRegex = /^[01]{32}$/;
    return binaryRegex.test(binary);
}

/** Main Function for converting IEEE754 hex or binary to decimal */

function ieee754ToDecimal(input, type, format) {
    let binary;

    // Convert Hex Input to Binary String
    if (type === 'hex') {
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
        // Denormalized Number
        else  {
            let denormalized = sign === 1 ? "-0." + significand : "+0." + significand;

            return trimTrailingZeros(denormalized) + "x2ˆ-126"; 
        } 
    }

    if (exponent === 255) {
        if (significand === '00000000000000000000000') {
            return sign === 0 ? '+Infinity' : '-Infinity';// Infinity
        } else if (significand.startsWith('01')) {
            return 'sNaN';
        } else if (significand.startsWith('1')) {
            return 'qNaN';
        }
    }

    // Calculate Unbiased Exponent
    const unbiasedExponent = exponent - 127;
    // Calculate Significand by adding implicit leading 1
    const mantissa = '1' + significand;

    let decimal = 0;
    // Calculate the decimal value from the the mantissa and exponents
    for (let i = 0; i < mantissa.length; i++) {
        decimal += parseInt(mantissa.charAt(i), 2) * Math.pow(2, unbiasedExponent - i);
    }

    decimal = sign === 1 ? -decimal : decimal; // Apply the Sign

    // Returns result in the desired format
    if (format === 'fixed') {
        return decimal.toFixed(100); // Fixed Point Notation; Adjust precision as needed
    } else {
        return decimal.toString(); // Default to String Representation
    }
}


/**Function to remove trailing zeroes from a decimal string */
function trimTrailingZeros(decimalString) {
    return decimalString.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0*$/, '');
}
