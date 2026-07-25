<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html', true, 303);
    exit;
}

$recipients = [
    'mv@biocoresolution.us',
    'bt@biocoresolution.us',
];
$fromEmail = 'website@biocoresolution.com';

function redirect_with_status(string $status): void
{
    header('Location: contact.html?status=' . rawurlencode($status) . '#inquiry-form', true, 303);
    exit;
}

function clean_text(string $key, int $maxLength): string
{
    $value = trim((string)($_POST[$key] ?? ''));
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = strip_tags($value);
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength);
    }
    return substr($value, 0, $maxLength);
}

// Hidden honeypot and a short time check reduce basic automated spam.
if (clean_text('website', 200) !== '') {
    redirect_with_status('success');
}

$started = filter_input(INPUT_POST, 'form_started', FILTER_VALIDATE_INT);
if ($started !== false && $started !== null && (time() - $started) < 3) {
    redirect_with_status('invalid');
}

$name = clean_text('name', 100);
$company = clean_text('company', 120);
$emailRaw = trim((string)($_POST['email'] ?? ''));
$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
$phone = clean_text('phone', 40);
$sampleType = clean_text('sample_type', 100);
$matrix = clean_text('matrix', 100);
$volume = clean_text('volume', 100);
$timeline = clean_text('timeline', 100);
$criteria = clean_text('criteria', 300);
$description = clean_text('description', 3000);
$consent = (string)($_POST['consent'] ?? '');

if ($name === '' || $company === '' || $email === false || $sampleType === '' || $description === '' || $consent !== 'yes') {
    redirect_with_status('invalid');
}

if (preg_match('/[\r\n]/', $emailRaw)) {
    redirect_with_status('invalid');
}

$subjectCompany = preg_replace('/[^A-Za-z0-9 .,&()\-]/', '', $company) ?: 'Unknown company';
$subject = 'BioCore website inquiry - ' . $subjectCompany;
$safeName = preg_replace('/[\r\n]+/', ' ', $name) ?: 'Website visitor';
$submittedAt = date('Y-m-d H:i:s T');
$remoteAddress = (string)($_SERVER['REMOTE_ADDR'] ?? 'Not available');

$body = implode("\n", [
    'A new biospecimen inquiry was submitted through biocoresolution.com.',
    '',
    'CONTACT',
    'Name: ' . $name,
    'Company: ' . $company,
    'Work email: ' . $email,
    'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
    '',
    'REQUEST',
    'Sample type: ' . $sampleType,
    'Matrix: ' . ($matrix !== '' ? $matrix : 'Not provided'),
    'Required volume / quantity: ' . ($volume !== '' ? $volume : 'Not provided'),
    'Titer / criteria: ' . ($criteria !== '' ? $criteria : 'Not provided'),
    'Timeline: ' . ($timeline !== '' ? $timeline : 'Not provided'),
    '',
    'PROJECT DESCRIPTION',
    $description,
    '',
    'Consent to reply: Yes',
    'Submitted: ' . $submittedAt,
    'Submitting IP: ' . $remoteAddress,
]);

$headers = [
    'From: BioCore Website <' . $fromEmail . '>',
    'Reply-To: ' . $safeName . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail(implode(',', $recipients), $subject, $body, implode("\r\n", $headers));
redirect_with_status($sent ? 'success' : 'error');
