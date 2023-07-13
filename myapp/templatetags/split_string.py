from django import template

register = template.Library()

@register.filter
def split_string(value, key):
    """
    Returns the value turned into a list.
    """
    return value.split(key)
