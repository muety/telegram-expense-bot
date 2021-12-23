const { parseExpenseInput } = require('../utils')

describe('Parse expense message input', function () {
    it('should successfully parse various inputs', function () {
        const testInputs = [
            ['1 Test #sub #test', 1, 'Test', '#sub', '#test'],
            ['1.0 Test #sub #test', 1, 'Test', '#sub', '#test'],
            ['1.0 Test Foo Bar #sub #test', 1, 'Test Foo Bar', '#sub', '#test'],
            ['1.0 Test', 1, 'Test', '', ''],
            ['0.5 🍰🐀☀️ #test', 0.5, '🍰🐀☀️', '#test'],
            ['1+2.0 + 7 -4 Test #test', 6, 'Test', '#test'],
            ['1+2.0 + 7 -4 Test', 6, 'Test', ''],
            ['1+2.0 + 7 -4 Test', 6, 'Test', ''],
            ['1 Test #a_b', 1, 'Test', '#a_b'],
        ]

        testInputs.forEach(input => {
            const result = parseExpenseInput(input[0])
            expect(result).toEqual(input.slice(1))
        })
    }),
        it('should fail to parse invalid inputs', function () {
            const testInputs = [
                '1',
                '1 #test',
                'abc Test #test',
                '1+ Test #test',
                '5*2-3 Test #test',
                '5/2-3 Test #test',
                '0 Test #test',
                '1 Test #🤓',
                '1 Test #a-b',
            ]

            testInputs.forEach(input => {
                const result = parseExpenseInput(input[0])
                expect(result[0]).toEqual(null)
            })
        })
})