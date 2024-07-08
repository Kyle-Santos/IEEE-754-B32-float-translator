$('#translateBtn').on('click', function() {
    const hexInput = $('#hexInput').val().trim();
    const binaryInput = $('#binaryInput').val().trim();
    const format = $('#format').val();
    let output = '';

    if (hexInput) {
        output = ieee754ToDecimal(hexInput, 'hex', format);
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

function ieee754ToDecimal(input, type, format) {
    let binary;
    if (type === 'hex') {
        binary = parseInt(input, 16).toString(2).padStart(32, '0');
    } else if (type === 'binary') {
        binary = input.padStart(32, '0');
    } else {
        return 'Invalid input type.';
    }

    const sign = parseInt(binary.charAt(0), 2);
    const exponent = parseInt(binary.substr(1, 8), 2) - 127;
    const mantissa = '1' + binary.substr(9);

    let decimal = 0;
    for (let i = 0; i < mantissa.length; i++) {
        decimal += parseInt(mantissa.charAt(i), 2) * Math.pow(2, exponent - i);
    }

    decimal = sign === 1 ? -decimal : decimal;

    if (format === 'fixed') {
        return decimal.toFixed(6); // Adjust precision as needed
    } else {
        return decimal.toString();
    }
}
