<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

// Safety: refuse to run tests if environment looks like production or using a remote MySQL
// Prevents accidental destructive commands against production databases.
$dbConnection = getenv('DB_CONNECTION') ?: env('DB_CONNECTION');
$dbHost = getenv('DB_HOST') ?: env('DB_HOST');
$appEnv = getenv('APP_ENV') ?: env('APP_ENV');

if ($appEnv === 'production' || ($dbConnection === 'mysql' && $dbHost && !in_array($dbHost, ['127.0.0.1', 'localhost', '::1']))) {
    fwrite(STDERR, "Refusing to run tests: environment looks like production or remote MySQL.\n");
    exit(1);
}

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}
