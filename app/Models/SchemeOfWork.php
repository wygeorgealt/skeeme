<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchemeOfWork extends Model
{
    use HasFactory;

    protected $table = 'scheme_of_work';

    protected $fillable = [
        'course_id',
        'week_number',
        'topic',
        'description',
        'objectives',
        'resources',
        'status',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'topic_id');
    }
}
