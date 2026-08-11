<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VectorStoreEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id',
        'vector_data',
        'metadata',
    ];

    protected $casts = [
        'vector_data' => 'array',
        'metadata' => 'array',
    ];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }
}
