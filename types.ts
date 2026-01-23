
import React from 'react';

export interface Proposal {
  id?: number;
  title: string;
  description: string;
  category: string;
  goal: string;
  how_to: string;
  eta: string;
  status: string;
}

export interface FeedbackMessage {
  id: string | number;
  name: string;
  title_number?: string;
  category: string;
  message: string;
  created_at: string;
  status: string;
  is_anonymous?: boolean;
}

export interface Participant {
  id?: number;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  display_order?: number;
}

export interface Supporter {
  id?: number;
  name: string;
  title_number: string;
  created_at: string;
}
